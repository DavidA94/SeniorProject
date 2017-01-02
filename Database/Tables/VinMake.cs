﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    class VinMake
    {
        [Required]
        [StringLength(2, MinimumLength = 2)]
        [Index(IsUnique = true)]
        [Key]
        string VinSegment { get; set; }

        [Required]
        string Make { get; set; }

    }
}