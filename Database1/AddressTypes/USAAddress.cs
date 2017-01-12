using System.ComponentModel.DataAnnotations;

namespace Database.AddressTypes
{
    class USAAddress : Address
    {
        
        [Required]
        public string StreetAddress { get; set; }

        [Required]
        public string City { get; set; }

        [Required]
        [StringLength(2, MinimumLength = 2)]
        public string State { get; set; }

        [Required]
        [Range(0, 99999)]
        public int ZipCode { get; set; }
    }
}
