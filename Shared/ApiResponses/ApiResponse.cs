using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shared.ApiResponses
{
    public class ApiResponse
    {
        public ApiResponse(bool successful, string message)
        {
            Successful = successful;
            Message = message;
            Errors = new List<Error>();
        }

        public bool Successful { get; private set; }
        public string Message { get; private set; }

        public List<Error> Errors { get; set; }
    }
}
