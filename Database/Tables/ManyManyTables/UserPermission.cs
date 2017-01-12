namespace Database.Tables.ManyManyTables
{
    public class UserPermission
    {
        public int UserID { get; set; }
        public User User { get; set; }

        public string PermissionType { get; set; }
        public Permission Permision { get; set; }
    }
}
