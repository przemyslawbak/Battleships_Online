using Microsoft.Extensions.Caching.Memory;
using Moq;

namespace Battleships.Wrappers
{
    public class MemoryCacheWrapper
    {
        public static IMemoryCache GetMemoryCache(object expectedValue, bool expectedTryResult)
        {
            Mock<ICacheEntry> entryMock = new Mock<ICacheEntry>();
            Mock<IMemoryCache> mockMemoryCache = new Mock<IMemoryCache>();
            mockMemoryCache
                .Setup(x => x.TryGetValue(It.IsAny<object>(), out expectedValue))
                .Returns(expectedTryResult);
            mockMemoryCache
                .Setup(x => x.CreateEntry(It.IsAny<object>()))
                .Returns(entryMock.Object);
            return mockMemoryCache.Object;
        }
    }
}
