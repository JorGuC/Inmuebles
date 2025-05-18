using InmuebleAplication.Models;
using Microsoft.EntityFrameworkCore;
namespace Data{
    public class AppDbContext : DbContext
    {
        private readonly IConfiguration _configuration;

        public AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration configuration)
            : base(options)
        {
            _configuration = configuration;
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Property> Properties { get; set; }
        public DbSet<PropertyImage> PropertyImages { get; set; }
        public DbSet<Petition> Petitions { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}

