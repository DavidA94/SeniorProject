using System.ComponentModel.DataAnnotations;

namespace Database.Tables
{
    class VinMake
    {
        [Required]
        [StringLength(2, MinimumLength = 2)]
        // TODO: [Index(IsUnique = true)]
        [Key]
        string VinSegment { get; set; }

        [Required]
        string Make { get; set; }

    }
}
