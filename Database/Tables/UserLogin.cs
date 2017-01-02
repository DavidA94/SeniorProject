using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class UserLogin
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LoginID { get; set; }

        public User User { get; set; }

        public bool PersistentLogin { get; set; }

        public DateTime InitialLoginTime { get; set; }

        public DateTime LastPingTime { get; set; }

        /// <summary>
        /// Null if the user has logged out
        /// </summary>
        public byte[] LoginToken { get; set; }
    }
}
