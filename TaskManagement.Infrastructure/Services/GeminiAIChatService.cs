using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TaskManagement.Core.Interfaces;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services
{
    public class GeminiAIChatService : IAIChatService
    {
        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string? _apiKey;

        public GeminiAIChatService(ApplicationDbContext context, HttpClient httpClient, IConfiguration configuration)
        {
            _context = context;
            _httpClient = httpClient;
            _apiKey = configuration["GeminiSettings:ApiKey"];
        }

        public async Task<string> AskQuestionAboutTaskAsync(int? taskId, string userMessage)
        {
            if (string.IsNullOrEmpty(_apiKey) || _apiKey == "YOUR_GEMINI_API_KEY_HERE")
            {
                await Task.Delay(1000); // Simulate network latency
                return $"[Mock AI Response] Hello! You said: '{userMessage}'. (Note: The Gemini API key is not configured in appsettings.json, so this is a simulated response to demonstrate the chat functionality).";
            }

            string systemPrompt = "You are a helpful AI assistant integrated into a Task Management application.";
            string contextInfo = "";

            if (taskId != null)
            {
                var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == taskId);
                if (task != null)
                {
                    contextInfo = $@"
Here is the context of the task the user is currently viewing:
- Task Title: {task.Title}
- Description: {task.Description}
- Status: {task.Status}
- Priority: {task.Priority}
- Due Date: {(task.DueDate.HasValue ? task.DueDate.Value.ToString("d") : "None")}

Please use this context to inform your response if it's relevant to the user's question.
";
                }
            }

            string fullPrompt = $"{systemPrompt}\n{contextInfo}\nUser Question: {userMessage}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = fullPrompt }
                        }
                    }
                }
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";

            var response = await _httpClient.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                return $"[Mock AI Response] (Fallback due to API error {response.StatusCode}): I received your message '{userMessage}'. Note: The Gemini API Key might be invalid or not configured correctly in appsettings.json. Please update the configuration to use the real AI.";
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            
            try
            {
                var text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text").GetString();

                return text ?? "No response generated.";
            }
            catch (Exception ex)
            {
                return $"Error parsing AI response: {ex.Message}";
            }
        }
    }
}
