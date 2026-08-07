using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.Core.Interfaces;

namespace TaskManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Require user to be authenticated
public class DashboardController : ControllerBase
{
    private readonly ITaskService _taskService;

    public DashboardController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics()
    {
        // Extract User ID from JWT Token claims
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("User ID not found in token.");
        }

        if (string.IsNullOrEmpty(roleClaim))
        {
            roleClaim = "User"; // Default to User if not found
        }

        var metrics = await _taskService.GetDashboardMetricsAsync(userId, roleClaim);
        
        return Ok(metrics);
    }
}
