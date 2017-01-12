using Database.Tables;
using Microsoft.EntityFrameworkCore;

namespace Database
{
    public class SeciovniContext : DbContext
    {
        public SeciovniContext(DbContextOptions<SeciovniContext> context) : base(context) { }

        public DbSet<User> Users { get; set; }
        public DbSet<UserLogin> Logins { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoicePageTemplate> InvoiceTemplates { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<InvoiceTemplateBinding>().HasKey(b => new { b.UniqueBindingID, b.BindingID });
        }
    }
}
