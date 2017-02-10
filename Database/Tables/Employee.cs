using Shared;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class Employee
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EmployeeID { get; set; }

        /// <summary>
        /// The foreign key for User
        /// </summary>
        public int UserID { get; set; }

        public User User { get; set; }

        public JobType Job { get; set; }

        public ICollection<Customer> Contacts { get; set; }
    }
}
