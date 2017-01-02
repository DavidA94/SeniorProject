using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class InvoiceTemplateBinding
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UniqueBindingID { get; set; }

        /// <summary>
        /// The Text to replace with the other value
        /// </summary>
        [Key]
        [RegularExpression(@"^\|_.*_\|$", ErrorMessage = "The binding ID must conform to |_[data]_|")]
        public string BindingID { get; set; }

        /// <summary>
        /// Holds the name of the table (class) that holds the column we want to bind to
        /// </summary>
        public string TableName { get; set; }

        /// <summary>
        /// Holds the name of the column (property) within the table that we want to bind to
        /// </summary>
        public string ColumnName { get; set; }
    }
}
