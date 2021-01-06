namespace Battleships.Services
{
    public interface IUserNameValidator
    {
        bool IsValidUserName(string userName);
        bool IsGameEmpty(string[] playerNames);
    }
}