namespace CinemaXNet.Application.Responses;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null) => new() { Success = true, Data = data, Message = message };
    public static ApiResponse<T> Fail(string message) => new() { Success = false, Message = message };
}

public class PagedResponse<T> : ApiResponse<IEnumerable<T>>
{
    public int PageIndex { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage { get; set; }
    public bool HasNextPage { get; set; }

    public static PagedResponse<T> Ok(IEnumerable<T> data, int pageIndex, int totalPages, bool hasPreviousPage, bool hasNextPage)
    {
        return new PagedResponse<T>
        {
            Success = true,
            Data = data,
            PageIndex = pageIndex,
            TotalPages = totalPages,
            HasPreviousPage = hasPreviousPage,
            HasNextPage = hasNextPage
        };
    }
}
