using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TaskManagement.Core.DTOs;
using TaskManagement.Core.Interfaces;

namespace TaskManagement.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public ContactController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendContactEmail([FromBody] ContactRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Extract the email of the currently logged-in user from the JWT token
                var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "Unknown User";
                
                // Format the final message to include who sent it
                var finalBody = $"Problem submitted by user: {userEmail}\n\nDescription:\n{request.Description}";

                // Send the actual email
                await _emailService.SendEmailAsync("u2023316@giki.edu.pk", $"Support Request: {request.Subject}", finalBody);
                
                return Ok(new { message = "Email sent successfully", reportedBy = userEmail });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while sending the email", error = ex.Message });
            }
        }
    }
}
