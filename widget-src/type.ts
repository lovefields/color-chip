interface CollectionMode {
    name: string;
    modeId: string;
}

interface ChipItem {
    id: string;
    description: string;
    hiddenFromPublishing: boolean;
    name: string;
    valuesByMode: {
        [key: string]: {
            type: string;
            id: string;
        };
    }[];
}

export interface Collection {
    id: string;
    modes: CollectionMode[];
    name: string;
    child: Variable[];
}
