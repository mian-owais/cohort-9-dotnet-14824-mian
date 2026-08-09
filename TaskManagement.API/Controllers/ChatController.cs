using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TaskManagement.Core.Interfaces;

namespace TaskManagement.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IAIChatService _chatService;

        public ChatController(IAIChatService chatService)
        {
            _chatService = chatService;
        }

        public class ChatRequest
        {
            public int? TaskId { get; set; }
            public string Message { get; set; } = string.Empty;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> AskQuestion([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message cannot be empty.");
            }

            var response = await _chatService.AskQuestionAboutTaskAsync(request.TaskId, request.Message);
            
            return Ok(new { Response = response });
        }
    }
}
