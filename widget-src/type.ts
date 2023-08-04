interface CollectionMode {
    name: string;
    modeId: string;
}

export interface Collection {
    id: string;
    modes: CollectionMode[];
    name: string;
}
