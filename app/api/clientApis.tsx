const SketchfabApiToekn = process.env.NEXT_PUBLIC_SKETCHFAB_API_TOKEN;


export const getAllModels = async (count: number = 9) => {
    try {
        const res = await fetch(
            `https://api.sketchfab.com/v3/search?type=models&q=race%20car&downloadable=true&sort_by=-likeCount&count=${count}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data;
    } catch (err: unknown) {
        return { err };
    }
};



export const getModelsByNextCursor = async (
    cursor: string,
    query: string = "race car", // default base query
    count: number = 12
) => {
    try {
        const url = `https://api.sketchfab.com/v3/search?type=models&q=${query}&downloadable=true&cursor=${cursor}&count=${count}`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await res.json();
        return data;
    } catch (err: unknown) {
        return { err };
    }
};



export const getModelsBySearchQuery = async (
    query: string,
    cursor: string | null = null,
    count: number = 12
) => {
    try {
        const url = cursor
            ? `https://api.sketchfab.com/v3/search?type=models&downloadable=true&archives_flavours=false&q=${query}&cursor=${cursor}&count=${count}`
            : `https://api.sketchfab.com/v3/search?type=models&downloadable=true&archives_flavours=false&q=${query}&count=${count}`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await res.json();
        return data;
    } catch (err: unknown) {
        return {
            err,
        };
    }
};

export const downloadModels = async (modelUid: string) => {
    try {
        const res = await fetch(
            `https://api.sketchfab.com/v3/models/${modelUid}/download`,
            {
                headers: {
                    Authorization: `Token ${SketchfabApiToekn}`,
                },
            }
        );
        const data = await res.json();
        return data;
    } catch (err: unknown) {
        return {
            err,
        };
    }
};


