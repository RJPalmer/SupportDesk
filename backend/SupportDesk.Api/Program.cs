using Microsoft.EntityFrameworkCore;
using SupportDesk.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<SupportDeskDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("SupportDesk")));
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy =>
    policy.WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");
app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SupportDeskDbContext>();
    await db.Database.EnsureCreatedAsync();
}

app.Run();
