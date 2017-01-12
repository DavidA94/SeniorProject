using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.ServiceContracts
{
    public class CreateUserContract
    {
        public UserLoginContract Credentials { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public List<PermissionType> Permissions { get; set; }
    }
}
