using Battleships.Services;
using Microsoft.Extensions.Caching.Memory;
using Moq;

namespace Battleships.Tests.UnitTests.Services
{
    public class MemoryAccessTests
    {
        private readonly Mock<IMemoryCache> _memoryCacheMock;
        private readonly MemoryAccess _service;

        public MemoryAccessTests()
        {
            _memoryCacheMock = new Mock<IMemoryCache>();

            _service = new MemoryAccess(_memoryCacheMock.Object);
        }

        //GetUserConnectionIdList
        //todo:

        //GetGameList
        //todo:
    }
}
