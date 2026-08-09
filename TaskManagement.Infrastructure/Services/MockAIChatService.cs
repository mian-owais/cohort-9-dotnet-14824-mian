using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Core.Interfaces;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services
{
    public class MockAIChatService : IAIChatService
    {
        private readonly ApplicationDbContext _context;

        public MockAIChatService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> AskQuestionAboutTaskAsync(int taskId, string userMessage)
        {
            var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == taskId);
            
            if (task == null)
            {
                return "I couldn't find that task in the database.";
            }

            // Mock RAG simulation
            await Task.Delay(1500); // Simulate network/AI delay

            return $@"**[Mock AI Response]**
            
I see you're asking about the task: **{task.Title}**.

Here is a summary based on the task details:
- **Description:** {task.Description}
- **Status:** {task.Status}
- **Due Date:** {task.DueDate:d}

**Guidance for your question:** ""{userMessage}""
Since I am currently a Mock AI service (awaiting an OpenAI API key), I cannot generate a dynamic response. 
However, to perform this task, I recommend reading the description carefully, breaking it into smaller steps, and updating the status once you make progress!
";
        }
    }
}
