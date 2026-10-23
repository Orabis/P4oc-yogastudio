interface InfoFieldProps {
    labelName: string;
    labelValue: string;
}

export default function InfoField({labelName, labelValue}: InfoFieldProps){
    return (
        <div className="border-b pb-4">
            <label className="block text-gray-600 text-sm font-semibold mb-1">
                {labelName}
            </label>
            <p className="text-lg text-gray-800">{labelValue}</p>
        </div>
    )
}