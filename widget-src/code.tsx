import type { Collection, ChipItem } from "./type";
import { getCollectionList, sortChipListForGroup, setup } from "./utils";

const { widget } = figma;
const { useSyncedState, useEffect, usePropertyMenu, AutoLayout, Text, Span, Rectangle } = widget;

function ColorChipWidget() {
    const [mode, setMode] = useSyncedState<string>("mode", "error"); // list, error, chip
    const [collectionList, setCollectionList] = useSyncedState<Collection[]>("collectionList", []);
    const [currentCollection, setCurrentCollection] = useSyncedState<Collection | null>("currentCollection", null);
    const [isLoad, setIsLoad] = useSyncedState<boolean>("isLoad", false);
    let structure;

    useEffect(() => {
        if (collectionList.length === 0 && isLoad === false) {
            setup({ setMode: setMode, setCollectionList: setCollectionList });
            setIsLoad(true);
        }

        figma.ui.onmessage = (msg) => {
            figma.closePlugin();
        };
    });

    usePropertyMenu(
        [
            {
                itemType: "action",
                tooltip: "Reset",
                propertyName: "reset",
            },
            {
                itemType: "action",
                tooltip: "Refresh",
                propertyName: "refresh",
            },
            {
                itemType: "action",
                tooltip: "Export CSS",
                propertyName: "export",
            },
        ],
        async ({ propertyName, propertyValue }) => {
            if (propertyName === "reset") {
                setCurrentCollection(null);
                setMode("list");
            }

            if (propertyName === "refresh") {
                await setup({ setMode: setMode, setCollectionList: setCollectionList });
            }

            if (propertyName === "export") {
                if (currentCollection !== null) {
                    const pageData = currentCollection as Collection;
                    let cssData = "";

                    cssData += `:root {`;

                    pageData.modes.map((mode, i) => {
                        const chipListData = sortChipListForGroup(pageData.child[mode.modeId]);
                        cssData += `\n`;
                        chipListData.map((row: ChipItem[], j) => {
                            row.map((chip: ChipItem, k) => {
                                cssData += `--color-${chip.name
                                    .toLocaleLowerCase()
                                    .replace("/", "-")
                                    .replaceAll(/[!@#\$%\^&\*()_\+\|]/g, "")}:`;

                                if (chip.value.a !== 1) {
                                    cssData += `rgba(${Math.round(chip.value.r * 255)},${Math.round(chip.value.g * 255)},${Math.round(chip.value.b * 255)},${chip.value.a.toFixed(2)});`;
                                } else {
                                    cssData += `#${chip.hexValue};`;
                                }

                                cssData += `\n`;
                            });

                            cssData += `\n`;
                        });
                    });

                    cssData += `}`;

                    return new Promise((resolve) => {
                        figma.showUI(`
                                <script>
                                    window.onmessage = (event) => {
                                        const data = event.data.pluginMessage;
                                        const link = document.createElement("a");
                                        link.href = "data:text/css;base64," + btoa(data.content);
                                        link.download = data.title;
                                        document.body.appendChild(link);
                                        link.click();

                                        parent.postMessage({ pluginMessage: { type: "close" } }, "*");
                                    };
                                </script>
                            `);
                        figma.ui.postMessage({
                            title: "Color Chip",
                            content: cssData,
                        });
                    });
                } else {
                    figma.notify("Choose you'r Color Variables.");
                }
            }
        }
    );

    switch (mode) {
        case "chip":
            const pageData = currentCollection as Collection;
            const listStructure = pageData.modes.map((mode, i) => {
                const chipListData = sortChipListForGroup(pageData.child[mode.modeId]);
                const row = chipListData.map((row: ChipItem[], j) => {
                    const col = row.map((chip: ChipItem, k) => {
                        return (
                            <AutoLayout width={214} direction="vertical" key={k}>
                                <Rectangle width="fill-parent" height={140} fill={chip.value} stroke="#e0e0e0" strokeWidth={1} cornerRadius={10}></Rectangle>

                                <AutoLayout
                                    width="fill-parent"
                                    direction="vertical"
                                    padding={{
                                        horizontal: 16,
                                        vertical: 12,
                                    }}
                                    spacing={6}
                                    stroke="#e0e0e0"
                                    strokeWidth={1}
                                    cornerRadius={10}
                                >
                                    <Text fill="#333" fontFamily="Inter" fontSize={12} fontWeight={700} width="fill-parent" truncate={2}>
                                        {chip.name}
                                    </Text>

                                    {chip.originName ? (
                                        <Text fill="#333" fontFamily="Inter" fontSize={12} fontWeight={700}>
                                            {chip.originName} (link)
                                        </Text>
                                    ) : (
                                        <Text fill="#333" fontFamily="Inter" fontSize={12} fontWeight={700}>
                                            #{chip.hexValue}
                                        </Text>
                                    )}

                                    {chip.description ? (
                                        <Text fill="#333" fontFamily="Inter" fontSize={12} fontWeight={700} truncate={2}>
                                            {chip.description}
                                        </Text>
                                    ) : null}
                                </AutoLayout>
                            </AutoLayout>
                        );
                    });

                    return (
                        <AutoLayout height="hug-contents" key={j} spacing={16}>
                            {col}
                        </AutoLayout>
                    );
                });

                return (
                    <AutoLayout key={i} width="hug-contents" height="hug-contents" direction="vertical" spacing={12}>
                        {pageData.modes.length === 1 ? null : (
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
                        )}

                        <AutoLayout direction="vertical" spacing={30}>
                            {row}
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
                        {/* <Text fill="#949494" fontFamily="Inter" fontSize={16} fontWeight={500}>
                            Click to copy!
                        </Text> */}
                    </AutoLayout>

                    {listStructure}
                </AutoLayout>
            );
            break;
        case "list":
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
