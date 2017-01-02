using Shared;
using Shared.ServiceContracts;
using System.ServiceModel;

namespace SecurityService
{
    [ServiceContract]
    public interface ISecurityService
    {

        /// <summary>
        /// Creates a new user
        /// </summary>
        /// <param name="userData">The user's data</param>
        /// <returns>The user's one-time-use password</returns>
        [OperationContract]
        string CreateUser(CreateUserContract userData);

        /// <summary>
        /// Sets a user up for resetting their password via a link
        /// </summary>
        /// <param name="credentials">The user's credenals needed for resetting the password</param>
        /// <returns>The token needed to reset the user's password</returns>
        [OperationContract]
        string ForgotPassword(UserLoginContract credentials);
        
        /// <summary>
        /// Attemps to login a user
        /// </summary>
        /// <param name="credentials">The user's credentials</param>
        /// <returns>A token to be used with each transaction, or null if the credentials were invalid, or "" if they must reset their password</returns>
        [OperationContract]
        string LoginUser(UserLoginContract credentials);

        /// <summary>
        /// Updates the user's password
        /// </summary>
        /// <param name="credentials">The user's original credentials</param>
        /// <param name="newPassword">The new password for the user</param>
        /// <returns>True if the password was updated</returns>
        [OperationContract]
        bool UpdatePassword(UserLoginContract credentials, string newPassword);

        /// <summary>
        /// Updates the user's password when they have forgotten it
        /// </summary>
        /// <param name="credentials">The user's original credentials</param>
        /// <param name="token">The token given to the user when they asked to reset their password</param>
        /// <param name="newPassword">The new password for the user</param>
        /// <returns>True if the password was updated</returns>
        [OperationContract]
        bool UpdatePassword(UserLoginContract credentials, string token, string newPassword);

        /// <summary>
        /// Checks if a token is valid
        /// </summary>
        /// <param name="permission">Where the user is trying to access</param>
        /// <param name="token">The token gotten from calling <see cref="LoginUser(UserLoginContract)"/></param>
        /// <returns>True if the user is logged in</returns>
        [OperationContract]
        bool ValidateUserToken(PermissionType permission, string token);
    }
}