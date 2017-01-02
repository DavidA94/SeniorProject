using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace Shared.ServiceContracts
{
    /// <summary>
    /// Contact used for logging in a user
    /// </summary>
    [DataContract]
    public class UserLoginContract
    {
        public UserLoginContract() { }

        /// <summary>
        /// Creates a new login contract
        /// </summary>
        /// <param name="email">The email address of the user logging in</param>
        /// <param name="password">The password of the user logging in</param>
        /// <param name="persistent">Indicates if the user wishes to remain logged in</param>
        public UserLoginContract(string email, string password, bool persistent = false)
        {
            UserEmail = email;
            Password = password;
            PersistentLogin = persistent;
        }

        /// <summary>
        /// The user's email address
        /// </summary>
        [DataMember]
        [EmailAddress]
        public string UserEmail { get; set; }

        /// <summary>
        /// The user's password
        /// </summary>
        [DataMember]
        [MinLength(6)]
        public string Password { get; set; }

        /// <summary>
        /// Indicates if the user wishes to remain logged in
        /// </summary>
        [DataMember]
        public bool PersistentLogin { get; set; } = false;

    }
}
