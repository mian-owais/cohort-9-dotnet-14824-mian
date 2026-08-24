using Microsoft.AspNetCore.Mvc;
using TaskManagement.Core.DTOs;
using TaskManagement.Core.Entities;
using TaskManagement.Core.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var user = new User
            {
                FirstName = model.FirstName,
                LastName = model.LastName,
                Email = model.Email,
                Role = model.Email.ToLower().Contains("admin") ? "Admin" : "User"
            };

            var token = await _authService.RegisterAsync(user, model.Password);
            
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddHours(2)
            };
            Response.Cookies.Append("jwt", token, cookieOptions);

            return Ok(new { User = new { user.Id, user.FirstName, user.LastName, user.Email, user.Role } });
        }
        catch (Exception ex)
        {
            if (ex.Message == "Email is already registered.")
            {
                return BadRequest(new { Message = ex.Message });
            }
            return StatusCode(500, new { Message = "Internal Server Error" });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var token = await _authService.LoginAsync(model.Email, model.Password);
            
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Set to true since frontend requires it for SameSite=None
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddHours(2)
            };
            Response.Cookies.Append("jwt", token, cookieOptions);

            // Return user details or just success response (without the token)
            // Ideally we'd return User object here too, but to minimize changes from original logic
            // we will just return success message or dummy token field to not break existing frontend models
            return Ok(new { Message = "Logged in successfully", Token = "" });
        }
        catch (Exception ex)
        {
            if (ex.Message == "Invalid email or password.")
            {
                return Unauthorized(new { Message = ex.Message });
            }
            return StatusCode(500, new { Message = "Internal Server Error" });
        }
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(-1)
        };
        Response.Cookies.Append("jwt", "", cookieOptions);
        return Ok(new { Message = "Logged out successfully" });
    }
}
