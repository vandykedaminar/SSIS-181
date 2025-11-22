"use client";
import './InsertForm.css'
import './InfoCard'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/Card'

export default function InsertForm({ insert_form_name="Insert Form", fields=[["Field_1: ", null, null], ["Field_2: ", null, null], ["Field_3: ", null]], functions=[] }) {
    const submitButton = async () => {
        await functions[1]();

        await new Promise(resolve => setTimeout(resolve, 100));

        functions[0]();
        functions[2]();
    }
    return (
        <>
            <Card className="insert">
                <CardHeader className='insert-header'>
                    <label className="text-lg font-semibold">{insert_form_name}</label>
                </CardHeader>
                <CardContent className='insert-inputs'>

                    {fields.map((f, i) => (
                        <div key={i} className="mb-3">
                            <label className="block text-sm text-gray-200 mb-1">{f[0]}</label>
                            <Input value={f[1]} onChange={(e) => f[2](e.target.value)} />
                        </div>
                    ))}

                    <div className="mt-2">
                        <Button onClick={submitButton}>Done</Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}