import { dialog } from "@/types";

export default function AiDialog(props: dialog) {
    return (
        <div className="flex flex-row items-center gap-x-3 mx-12">
            <div className={`w-fit h-fit px-3 py-1 bg-opacity-100 rounded-lg ${props.severity === "warning" ? "bg-orange-500" : "bg-red-500"}`}>
                <span color="text-white font-bold">{props.id}</span>
            </div>
            <p className="text-white">{props.content}</p>
        </div>
    )
}