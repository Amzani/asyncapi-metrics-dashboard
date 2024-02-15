import {
    Select,
    SelectItem,
  } from '@tremor/react';

export default function Header() {

  return (
    <div className='border-b border-solid border-indigo-900 pb-10'>
        <div className="flex pl-24 pt-24">
            <h1 className='text-3xl'>AsyncAPI Metrics Dashboard</h1>
        </div>
        <div className="flex pl-24 pt-4">
            <div className='w-1/6 mr-2'>
                <Select defaultValue="1">
                    <SelectItem value="1">Developer Experience</SelectItem>
                </Select>
            </div>
            <div className='w-1/6'>
                <Select defaultValue="1">
                    <SelectItem value="1">1 Day ago</SelectItem>
                    <SelectItem value="2">1 Week ago</SelectItem>
                    <SelectItem value="3">1 Month ago</SelectItem>
                    <SelectItem value="4">3 Months ago</SelectItem>
                </Select>
            </div>
        </div>
    </div>
    
  )
}