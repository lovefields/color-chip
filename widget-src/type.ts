interface CollectionMode {
    name: string;
    modeId: string;
}

export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface ChipItem {
    id: string;
    description: string;
    hiddenFromPublishing: boolean;
    name: string;
    type: string;
    originName: string | null;
    hashValue: string | null;
    value: RGBA;
}

export interface Collection {
    id: string;
    modes: CollectionMode[];
    name: string;
    child: { [key: string]: ChipItem[] };
}
