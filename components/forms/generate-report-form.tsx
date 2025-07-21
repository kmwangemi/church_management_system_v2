// 'use client';

// import { zodResolver } from '@hookform/resolvers/zod';
// import { BarChart3, Loader2 } from 'lucide-react';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import * as z from 'zod';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';

// const reportSchema = z.object({
//   name: z.string().min(5, 'Report name must be at least 5 characters'),
//   type: z.string().min(1, 'Please select report type'),
//   description: z.string().min(10, 'Description must be at least 10 characters'),
//   dateRange: z.string().min(1, 'Please select date range'),
//   format: z.string().min(1, 'Please select output format'),
//   includeCharts: z.boolean().default(true),
//   includeComparisons: z.boolean().default(false),
//   departments: z
//     .array(z.string())
//     .min(1, 'Please select at least one department'),
//   customStartDate: z.string().optional(),
//   customEndDate: z.string().optional(),
// });

// type ReportForm = z.infer<typeof reportSchema>;

// interface GenerateReportFormProps {
//   onSuccess: () => void;
// }

// const departments = [
//   { id: 'all', name: 'All Departments' },
//   { id: 'worship', name: 'Worship Team' },
//   { id: 'youth', name: 'Youth Ministry' },
//   { id: 'children', name: "Children's Ministry" },
//   { id: 'ushering', name: 'Ushering Department' },
//   { id: 'choir', name: 'Choir' },
//   { id: 'media', name: 'Media Team' },
// ];

// export function GenerateReportForm({ onSuccess }: GenerateReportFormProps) {
//   const [isLoading, setIsLoading] = useState(false);

//   const form = useForm<ReportForm>({
//     resolver: zodResolver(reportSchema),
//     defaultValues: {
//       name: '',
//       type: '',
//       description: '',
//       dateRange: '',
//       format: 'pdf',
//       includeCharts: true,
//       includeComparisons: false,
//       departments: [],
//       customStartDate: '',
//       customEndDate: '',
//     },
//   });

//   const onSubmit = async (data: ReportForm) => {
//     setIsLoading(true);
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//       console.log('Report data:', data);
//       onSuccess();
//     } catch (error) {
//       console.error('Error generating report:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Form {...form}>
//       <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <BarChart3 className="h-5 w-5" />
//               <span>Report Configuration</span>
//             </CardTitle>
//             <CardDescription>
//               Configure your custom report parameters
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Report Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter report name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               <FormField
//                 control={form.control}
//                 name="type"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Report Type</FormLabel>
//                     <Select
//                       defaultValue={field.value}
//                       onValueChange={field.onChange}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select type" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="attendance">
//                           Attendance Report
//                         </SelectItem>
//                         <SelectItem value="financial">
//                           Financial Report
//                         </SelectItem>
//                         <SelectItem value="membership">
//                           Membership Report
//                         </SelectItem>
//                         <SelectItem value="events">Events Report</SelectItem>
//                         <SelectItem value="discipleship">
//                           Discipleship Report
//                         </SelectItem>
//                         <SelectItem value="custom">Custom Report</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="format"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Output Format</FormLabel>
//                     <Select
//                       defaultValue={field.value}
//                       onValueChange={field.onChange}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select format" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="pdf">PDF Document</SelectItem>
//                         <SelectItem value="excel">Excel Spreadsheet</SelectItem>
//                         <SelectItem value="csv">CSV File</SelectItem>
//                         <SelectItem value="powerpoint">
//                           PowerPoint Presentation
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       placeholder="Describe what this report should include..."
//                       rows={3}
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="dateRange"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Date Range</FormLabel>
//                   <Select
//                     defaultValue={field.value}
//                     onValueChange={field.onChange}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select date range" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="last-week">Last Week</SelectItem>
//                       <SelectItem value="last-month">Last Month</SelectItem>
//                       <SelectItem value="last-quarter">Last Quarter</SelectItem>
//                       <SelectItem value="last-year">Last Year</SelectItem>
//                       <SelectItem value="ytd">Year to Date</SelectItem>
//                       <SelectItem value="custom">Custom Range</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {form.watch('dateRange') === 'custom' && (
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                 <FormField
//                   control={form.control}
//                   name="customStartDate"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Start Date</FormLabel>
//                       <FormControl>
//                         <Input type="date" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="customEndDate"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>End Date</FormLabel>
//                       <FormControl>
//                         <Input type="date" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             )}

//             <FormField
//               control={form.control}
//               name="departments"
//               render={() => (
//                 <FormItem>
//                   <FormLabel>Include Departments</FormLabel>
//                   <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//                     {departments.map((dept) => (
//                       <FormField
//                         control={form.control}
//                         key={dept.id}
//                         name="departments"
//                         render={({ field }) => {
//                           return (
//                             <FormItem
//                               className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-gray-50"
//                               key={dept.id}
//                             >
//                               <FormControl>
//                                 <Checkbox
//                                   checked={field.value?.includes(dept.id)}
//                                   onCheckedChange={(checked) => {
//                                     const newValue = checked
//                                       ? [...field.value, dept.id]
//                                       : field.value?.filter(
//                                           (value) => value !== dept.id
//                                         );
//                                     field.onChange(newValue);
//                                   }}
//                                 />
//                               </FormControl>
//                               <FormLabel className="cursor-pointer font-medium text-sm">
//                                 {dept.name}
//                               </FormLabel>
//                             </FormItem>
//                           );
//                         }}
//                       />
//                     ))}
//                   </div>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="includeCharts"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-row items-start space-x-3 space-y-0">
//                     <FormControl>
//                       <Checkbox
//                         checked={field.value}
//                         onCheckedChange={field.onChange}
//                       />
//                     </FormControl>
//                     <div className="space-y-1 leading-none">
//                       <FormLabel>Include Charts and Graphs</FormLabel>
//                       <p className="text-gray-500 text-sm">
//                         Add visual representations of the data
//                       </p>
//                     </div>
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="includeComparisons"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-row items-start space-x-3 space-y-0">
//                     <FormControl>
//                       <Checkbox
//                         checked={field.value}
//                         onCheckedChange={field.onChange}
//                       />
//                     </FormControl>
//                     <div className="space-y-1 leading-none">
//                       <FormLabel>Include Period Comparisons</FormLabel>
//                       <p className="text-gray-500 text-sm">
//                         Compare with previous periods for trend analysis
//                       </p>
//                     </div>
//                   </FormItem>
//                 )}
//               />
//             </div>
//           </CardContent>
//         </Card>

//         <div className="flex justify-end space-x-4">
//           <Button onClick={onSuccess} type="button" variant="outline">
//             Cancel
//           </Button>
//           <Button disabled={isLoading} type="submit">
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Generating Report...
//               </>
//             ) : (
//               'Generate Report'
//             )}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }
