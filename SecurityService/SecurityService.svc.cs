using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using Shared.ServiceContracts;
using System.IO;
using Database.Tables;
using Database;
using System.Data.Entity.Validation;
using Shared;
using System.Security.Cryptography;
using System.Globalization;
using System.Security.Permissions;
using System.Security.Principal;
using System.Web.Security;

namespace SecurityService
{
    public class SecurityService : ISecurityService
    {
        const int RESET_TOKEN_LENGHT = 37;
        const int PASSWORD_SALT_LENGTH = 32;
        const int SAVED_LOGIN_TOKEN_LENGTH = 32;

        public string CreateUser(CreateUserContract userData)
        {
            // Ensure we were given valid data
            if (string.IsNullOrWhiteSpace(userData.FirstName) || string.IsNullOrWhiteSpace(userData.LastName) ||
                string.IsNullOrWhiteSpace(userData.Credentials.UserEmail) ||
                string.IsNullOrWhiteSpace(userData.Credentials.Password))
            {
                return null;
            }

            // Get a random password and salt, then make the hashed password
            var password = Path.GetFileNameWithoutExtension(Path.GetRandomFileName()) + Path.GetFileNameWithoutExtension(Path.GetRandomFileName());
            var salt = Encryption.GetRandomBytes(PASSWORD_SALT_LENGTH);
            var passwordHash = Encryption.ComputeHash(password, salt);

            // Connect to the database
            using (var db = new SeciovniContext())
            {
                // Get the permissions from the DB
                var permissions = from permission in db.Permissions
                                  join permissionType in userData.Permissions
                                  on permission.PermissionType equals permissionType
                                  select permission;

                // Create the new user object
                var newUser = new User()
                {
                    Email = userData.Credentials.UserEmail,
                    FirstName = userData.FirstName,
                    LastName = userData.LastName,
                    MustResetPassword = true,
                    Password = passwordHash,
                    Permisions = permissions.ToList(),
                    Salt = salt,
                };

                // Add it to the database
                db.Users.Add(newUser);

                try
                {
                    // As long as there were changes, return the password
                    if (db.SaveChanges() != 0)
                    {
                        return password;
                    }
                }
                catch (DbEntityValidationException ex)
                {
                    logValidationException(ex);
                }
            }

            // If we make it to here, something went wrong
            return null;
        }

        public string ForgotPassword(UserLoginContract credentials)
        {
            var expireTime = DateTime.Now;
            var token = Convert.ToBase64String(Encryption.GetRandomBytes(RESET_TOKEN_LENGHT)) + "-" + expireTime.ToString("yyyyMMddHHmmss");

            using (var db = new SeciovniContext())
            {
                var user = db.Users.FirstOrDefault(u => u.Email == credentials.UserEmail);

                // If the user doesn't exist, don't give back a token
                if(user == null)
                {
                    return null;
                }

                user.ResetTimeout = expireTime;
                user.ResetToken = token;

                try
                {
                    db.SaveChanges();
                }
                catch (DbEntityValidationException ex)
                {
                    logValidationException(ex);
                }
            }

            return token;
        }

        public string LoginUser(UserLoginContract credentials)
        {
            using (var db = new SeciovniContext())
            {
                // Find the user
                var user = db.Users.FirstOrDefault(u => u.Email == credentials.UserEmail);

                // Stop if we didn't find the user
                if (user == null) return null;

                // Hash the password we were given
                var pwHash = Encryption.ComputeHash(credentials.Password, user.Salt);

                // Stop if it doesn't match
                if (pwHash != user.Password) return null;

                // If the user needs to reset, return an empty string
                if (user.MustResetPassword) return "";

                // Create a token to be used
                var loginToken = Encryption.GetRandomBytes(SAVED_LOGIN_TOKEN_LENGTH);

                // Add the login
                db.Logins.Add(new UserLogin()
                {
                    InitialLoginTime = DateTime.Now,
                    LastPingTime = DateTime.Now,
                    LoginToken = loginToken,
                    PersistentLogin = credentials.PersistentLogin,
                    User = user
                });

                try
                {
                    if(db.SaveChanges() != 0)
                    {
                        return Convert.ToBase64String(loginToken);
                    }
                }
                catch(DbEntityValidationException ex)
                {
                    logValidationException(ex);
                }
            }

            // If we make it this far, we failed to login
            return null;
        }

        
        public bool UpdatePassword(UserLoginContract credentials, string newPassword)
        {
            using (var db = new SeciovniContext())
            {
                var user = db.Users.FirstOrDefault(u => u.Email == credentials.UserEmail);

                if (user == null) return false;

                var hashedPW = Encryption.ComputeHash(credentials.Password, user.Salt);
                var newHashedPW = Encryption.ComputeHash(newPassword, user.Salt);

                if (user.Password != hashedPW) return false;
                
                user.Password = newHashedPW;

                try
                {
                    // This should also prevent setting the same password
                    if(db.SaveChanges() > 0)
                    {
                        return true;
                    }
                }
                catch(DbEntityValidationException ex)
                {
                    logValidationException(ex);
                }
            }

            // If we make it this far, the password was not reset
            return false;
        }

        public bool UpdatePassword(UserLoginContract credentials, string token, string newPassword)
        {
            using (var db = new SeciovniContext())
            {
                var user = db.Users.FirstOrDefault(u => u.Email == credentials.UserEmail);

                // If we didn't find the user, or the token we were given was invalid, stop here
                if (user == null || token != user.ResetToken) return false;

                // Figure out when the reset token was sent
                var sentTimeStr = token.Substring(token.LastIndexOf('-') + 1);
                var sentTime = DateTime.ParseExact(sentTimeStr, "yyyyMMddHHmmss", CultureInfo.InvariantCulture);

                // If the reset it over 24 hours old, its invalid
                if (DateTime.Now - sentTime > TimeSpan.FromHours(24)) return false;

                // Otherwise, hash the new password and set it
                var newHashedPW = Encryption.ComputeHash(newPassword, user.Salt);
                user.Password = newHashedPW;

                try
                {
                    // This should also prevent setting the same password
                    if (db.SaveChanges() > 0)
                    {
                        return true;
                    }
                }
                catch (DbEntityValidationException ex)
                {
                    logValidationException(ex);
                }
            }

            // If we make it this far, the password was not reset
            return false;
        }

        public bool ValidateUserToken(PermissionType permisison, string token)
        {
            var storedToken = Convert.FromBase64String(token);

            using (var db = new SeciovniContext())
            {
                // Find the logged in user by their token
                var login = db.Logins.FirstOrDefault(l => l.LoginToken == storedToken);

                // If we didn't find the login, or they don't have permission to access this area, stop here
                if (login == null || login.LoginToken == null ||
                    login.User.Permisions.FirstOrDefault(p => p.PermissionType == permisison) == null) return false;

                // A persistent login must have been used with the past week, and a non-persistent one within the last hour
                TimeSpan timeout = login.PersistentLogin ? TimeSpan.FromDays(7) : TimeSpan.FromHours(1);

                // If they haven't pinged recently enough, return true
                if (DateTime.Now - login.LastPingTime > timeout) return false;

                // Otherwise, update that they just pinged
                login.LastPingTime = DateTime.Now;

                // And save it (just assume it will work)
                try
                {
                    db.SaveChanges();
                }
                catch { }

                return true;
            }
        }


        private void logValidationException(DbEntityValidationException ex)
        {
            // Log all errors we got
            foreach (var error in ex.EntityValidationErrors)
            {
                Logger.WriteError($"Entity of type {error.Entry.Entity.GetType().Name} in state {error.Entry.State} " +
                                  $"has the following validation errors:");
                Logger.Indent();
                foreach (var validationError in error.ValidationErrors)
                {
                    Logger.WriteLine($"Property: {validationError.PropertyName}; Error: {validationError.ErrorMessage}");
                }
                Logger.Unindent();
            }
        }
    }
}
