import type { Collection } from "./type";
import { getCollectionList } from "./utils";

const { widget } = figma;
const { useSyncedState, useEffect, AutoLayout, Text, Span } = widget;

function ColorChipWidget() {
    const [mode, setMode] = useSyncedState<string>("mode", "error"); // list, error, chip
    const [collectionList, setCollectionList] = useSyncedState<Collection[]>("collectionList", []);
    const [currentCollection, setCurrentCollection] = useSyncedState<Collection | null>("currentCollection", null);
    const [isLoad, setIsLoad] = useSyncedState<boolean>("isLoad", false);
    let structure;

    useEffect(() => {
        if (collectionList.length === 0 && isLoad === false) {
            const collectionList = figma.variables.getLocalVariableCollections();
            const vartiableList = figma.variables.getLocalVariables();

            if (collectionList.length === 0 || vartiableList.length === 0) {
                setMode("error");
            } else {
                const list = getCollectionList(collectionList, vartiableList);

                if (list.length === 0) {
                    setMode("error");
                } else {
                    setMode("list");
                    setCollectionList(list);
                }
            }
            setIsLoad(true);
        }
    });

    switch (mode) {
        case "chip":
            const pageData = currentCollection as Collection;
            console.log(pageData)

            const listStructure = pageData.modes.map((mode, i) => {

                return (
                    <AutoLayout key={i} direction="vertical" spacing={12}>
                        <AutoLayout
                            width="hug-contents"
                            height={37}
                            fill="#eff3ff"
                            verticalAlignItems="center"
                            padding={{
                                vertical: 8,
                                horizontal: 12,
                            }}
                            cornerRadius={5}
                        >
                            <Text fill="#5176f8" fontFamily="Inter" fontSize={14} fontWeight={600}>
                                {mode.name}
                            </Text>
                        </AutoLayout>
                    </AutoLayout>
                );
            });

            structure = (
                <AutoLayout
                    fill="#fff"
                    direction="vertical"
                    spacing={20}
                    padding={{
                        vertical: 30,
                        horizontal: 30,
                    }}
                    effect={{
                        type: "drop-shadow",
                        color: { r: 0.0392156862745098, g: 0.011764705882352941, b: 0.12156862745098039, a: 0.1 },
                        offset: { x: 0, y: 4 },
                        blur: 8,
                    }}
                >
                    <AutoLayout direction="vertical" spacing={-1}>
                        <Text fill="#333" fontFamily="Inter" fontSize={20} fontWeight={900}>
                            {pageData.name}
                        </Text>
                        <Text fill="#949494" fontFamily="Inter" fontSize={16} fontWeight={500}>
                            Click to copy!
                        </Text>
                    </AutoLayout>

                    {listStructure}
                </AutoLayout>
            );
            break;
        case "list":
            console.log(collectionList);

            let collectionStructure = collectionList.map((item, i) => {
                return (
                    <AutoLayout
                        width={380}
                        height={45}
                        horizontalAlignItems="center"
                        verticalAlignItems="center"
                        cornerRadius={5}
                        stroke="#ced9ff"
                        strokeWidth={1}
                        strokeAlign="inside"
                        hoverStyle={{
                            fill: "#5176f8",
                        }}
                        onClick={() => {
                            setMode("chip");
                            setCurrentCollection(item);
                        }}
                        key={i}
                    >
                        <Text
                            fill="#5176f8"
                            fontFamily="Inter"
                            fontSize={14}
                            fontWeight={700}
                            hoverStyle={{
                                fill: "#fff",
                            }}
                        >
                            {item.name}
                        </Text>
                    </AutoLayout>
                );
            });

            structure = (
                <AutoLayout
                    width="hug-contents"
                    height="hug-contents"
                    direction="vertical"
                    spacing={16}
                    fill="#fff"
                    padding={{
                        vertical: 30,
                        horizontal: 20,
                    }}
                    effect={{
                        type: "drop-shadow",
                        color: { r: 0, g: 0, b: 0, a: 0 },
                        offset: { x: 0, y: 4 },
                        blur: 8,
                    }}
                >
                    <Text width="fill-parent" fontSize={14} fontWeight={700} fontFamily={"Inter"} fill="#333">
                        Choose Your Color Variables below.
                    </Text>

                    <AutoLayout width="hug-contents" height="hug-contents" direction="vertical" spacing={12}>
                        {collectionStructure}
                    </AutoLayout>
                </AutoLayout>
            );
            break;
        default:
            structure = (
                <AutoLayout
                    width="hug-contents"
                    height="hug-contents"
                    fill="#fff"
                    direction="vertical"
                    horizontalAlignItems="center"
                    padding={{
                        vertical: 50,
                        horizontal: 50,
                    }}
                    cornerRadius={10}
                    stroke="#e0e0e0"
                    strokeWidth={1}
                    strokeAlign="inside"
                    effect={{
                        type: "drop-shadow",
                        color: { r: 0, g: 0, b: 0, a: 0.1 },
                        offset: { x: 0, y: 4 },
                        blur: 48,
                    }}
                >
                    <Text width="hug-contents" fontFamily="Inter" fontSize={18} fontWeight={600} lineHeight="150%">
                        OOPS! You don’t have{" "}
                        <Span fill="#5176F8" fontWeight={900}>
                            Variables.
                        </Span>
                    </Text>
                    <Text width="hug-contents" fontFamily="Inter" fontSize={18} fontWeight={600} lineHeight="150%">
                        Create same{" "}
                        <Span fill="#5176F8" fontWeight={900}>
                            Variables
                        </Span>{" "}
                        Please.
                    </Text>
                </AutoLayout>
            );
    }

    return structure;
}

widget.register(ColorChipWidget);
