using System.Threading.Tasks;

namespace TaskManagement.Core.Interfaces
{
    public interface IAIChatService
    {
        Task<string> AskQuestionAboutTaskAsync(int? taskId, string userMessage);
    }
}
