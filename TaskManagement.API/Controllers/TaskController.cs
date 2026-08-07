using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.Core.DTOs;
using TaskManagement.Core.Interfaces;

namespace TaskManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TaskController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TaskController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    private (int UserId, string Role) GetUserInfo()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "User";
        int.TryParse(userIdStr, out int userId);
        return (userId, role);
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks()
    {
        var (userId, role) = GetUserInfo();
        if (userId == 0) return Unauthorized();

        var tasks = await _taskService.GetTasksAsync(userId, role);
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var (userId, role) = GetUserInfo();
        if (userId == 0) return Unauthorized();

        var task = await _taskService.GetTaskByIdAsync(id, userId, role);
        if (task == null) return NotFound();

        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask(CreateTaskDto dto)
    {
        var (userId, _) = GetUserInfo();
        if (userId == 0) return Unauthorized();

        var createdTask = await _taskService.CreateTaskAsync(dto, userId);
        return CreatedAtAction(nameof(GetTask), new { id = createdTask.Id }, createdTask);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto dto)
    {
        var (userId, role) = GetUserInfo();
        if (userId == 0) return Unauthorized();

        var updatedTask = await _taskService.UpdateTaskAsync(id, dto, userId, role);
        if (updatedTask == null) return NotFound();

        return Ok(updatedTask);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var (userId, role) = GetUserInfo();
        if (userId == 0) return Unauthorized();

        var success = await _taskService.DeleteTaskAsync(id, userId, role);
        if (!success) return NotFound();

        return NoContent();
    }
}
