namespace Battleships.Services
{
    public class UserNameValidator : IUserNameValidator
    {
        public bool IsGameEmpty(string[] playerNames)
        {
            if (playerNames[0] == "" && playerNames[1] == "")
            {
                return true;
            }

            if (playerNames[0] == "COMPUTER" && string.IsNullOrEmpty(playerNames[1]))
            {
                return true;
            }

            if (string.IsNullOrEmpty(playerNames[0]) && playerNames[1] == "COMPUTER")
            {
                return true;
            }

            return false;
        }

        public bool IsValidUserName(string name)
        {
            if (!string.IsNullOrEmpty(name))
            {
                if (name != "COMPUTER")
                {
                    return true;
                }
            }

            return false;
        }
    }
}
