export type RequestParams = Request & {
    ip: { address: string };
    params: { shortUrl: string };
    headers?: { [key: string]: string };
    error: (status: number, message: string) => void;
    set: {
        status: number;
    }
}

export type RequestQuery =  {
    ip: { address: string };
    headers?: { [key: string]: string };
    query: {
        shortCodes: string
    }
    error: (status: number, message: string) => void;
    set: {
        status: number;
    }
}

export type RequestWithIP = Request & { ip: { address: string } }

export type RequestWithBody = Request & { 
    body: RequestBody,
    set: {
        status: number;
    }
}

interface RequestBody {
    url: string;
    shortUrl: string;
    userId?: number;
    expirationDate?: Date;
    clickCount?: number;
}
