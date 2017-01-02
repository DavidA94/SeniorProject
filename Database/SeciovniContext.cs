using Database.Tables;
using System.Data.Entity;

namespace Database
{
    public class SeciovniContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<UserLogin> Logins { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoicePageTemplate> InvoiceTemplates { get; set; }
    }
}
