import type { Collection } from "./type";

export function getCollectionList(data: VariableCollection[]): Collection[] {
    const list: Collection[] = [];

    data.forEach((item) => {
        list.push({
            id: item.id,
            name: item.name,
            modes: item.modes,
        });
    });

    return list;
}
