using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Threading.Tasks;
using TaskManagement.API.Controllers;
using TaskManagement.Core.Interfaces;
using Xunit;

namespace TaskManagement.Tests.Controllers
{
    public class ChatControllerTests
    {
        private readonly Mock<IAIChatService> _mockChatService;
        private readonly ChatController _controller;

        public ChatControllerTests()
        {
            _mockChatService = new Mock<IAIChatService>();
            _controller = new ChatController(_mockChatService.Object);
        }

        [Fact]
        public async Task AskQuestion_EmptyMessage_ReturnsBadRequest()
        {
            // Arrange
            var request = new ChatController.ChatRequest
            {
                TaskId = 1,
                Message = ""
            };

            // Act
            var result = await _controller.AskQuestion(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Message cannot be empty.", badRequestResult.Value);
        }

        [Fact]
        public async Task AskQuestion_ValidRequest_ReturnsOkWithResponse()
        {
            // Arrange
            var request = new ChatController.ChatRequest
            {
                TaskId = 1,
                Message = "How do I do this?"
            };
            
            _mockChatService.Setup(s => s.AskQuestionAboutTaskAsync(request.TaskId, request.Message))
                .ReturnsAsync("Here is how you do it.");

            // Act
            var result = await _controller.AskQuestion(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            
            // We expect an anonymous object, use reflection or dynamic to check property
            var responseProperty = okResult.Value.GetType().GetProperty("Response");
            Assert.NotNull(responseProperty);
            
            var responseValue = responseProperty.GetValue(okResult.Value) as string;
            Assert.Equal("Here is how you do it.", responseValue);
        }

        [Fact]
        public async Task AskQuestion_GlobalChatNullTaskId_ReturnsOkWithResponse()
        {
            // Arrange
            var request = new ChatController.ChatRequest
            {
                TaskId = null,
                Message = "General question"
            };
            
            _mockChatService.Setup(s => s.AskQuestionAboutTaskAsync(null, request.Message))
                .ReturnsAsync("Global AI Response");

            // Act
            var result = await _controller.AskQuestion(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var responseProperty = okResult.Value.GetType().GetProperty("Response");
            var responseValue = responseProperty.GetValue(okResult.Value) as string;
            
            Assert.Equal("Global AI Response", responseValue);
        }
    }
}
