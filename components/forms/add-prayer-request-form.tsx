// 'use client';

// import { zodResolver } from '@hookform/resolvers/zod';
// import { Headphones, Loader2 } from 'lucide-react';
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

// const prayerRequestSchema = z.object({
//   title: z.string().min(5, 'Title must be at least 5 characters'),
//   description: z.string().min(20, 'Description must be at least 20 characters'),
//   category: z.string().min(1, 'Please select a category'),
//   priority: z.string().min(1, 'Please select priority level'),
//   isAnonymous: z.boolean().default(false),
//   isPublic: z.boolean().default(true),
//   requesterName: z.string().optional(),
//   requesterEmail: z.string().email().optional(),
// });

// type PrayerRequestForm = z.infer<typeof prayerRequestSchema>;

// interface AddPrayerRequestFormProps {
//   onSuccess: () => void;
// }

// export function AddPrayerRequestForm({ onSuccess }: AddPrayerRequestFormProps) {
//   const [isLoading, setIsLoading] = useState(false);

//   const form = useForm<PrayerRequestForm>({
//     resolver: zodResolver(prayerRequestSchema),
//     defaultValues: {
//       title: '',
//       description: '',
//       category: '',
//       priority: '',
//       isAnonymous: false,
//       isPublic: true,
//       requesterName: '',
//       requesterEmail: '',
//     },
//   });

//   const onSubmit = async (data: PrayerRequestForm) => {
//     setIsLoading(true);
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 1500));
//       console.log('Prayer request data:', data);
//       onSuccess();
//     } catch (error) {
//       console.error('Error submitting prayer request:', error);
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
//               <Headphones className="h-5 w-5" />
//               <span>Prayer Request Details</span>
//             </CardTitle>
//             <CardDescription>
//               Submit a prayer request for the church community
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <FormField
//               control={form.control}
//               name="title"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Prayer Request Title</FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="Brief title for your prayer request"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       placeholder="Please provide details about your prayer request..."
//                       rows={4}
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               <FormField
//                 control={form.control}
//                 name="category"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Category</FormLabel>
//                     <Select
//                       defaultValue={field.value}
//                       onValueChange={field.onChange}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select category" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="health">Health & Healing</SelectItem>
//                         <SelectItem value="family">
//                           Family & Relationships
//                         </SelectItem>
//                         <SelectItem value="career">Career & Work</SelectItem>
//                         <SelectItem value="financial">Financial</SelectItem>
//                         <SelectItem value="spiritual">
//                           Spiritual Growth
//                         </SelectItem>
//                         <SelectItem value="thanksgiving">
//                           Thanksgiving & Praise
//                         </SelectItem>
//                         <SelectItem value="guidance">
//                           Guidance & Wisdom
//                         </SelectItem>
//                         <SelectItem value="other">Other</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="priority"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Priority</FormLabel>
//                     <Select
//                       defaultValue={field.value}
//                       onValueChange={field.onChange}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select priority" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="low">Low</SelectItem>
//                         <SelectItem value="medium">Medium</SelectItem>
//                         <SelectItem value="high">High</SelectItem>
//                         <SelectItem value="urgent">Urgent</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <div className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="isAnonymous"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-row items-start space-x-3 space-y-0">
//                     <FormControl>
//                       <Checkbox
//                         checked={field.value}
//                         onCheckedChange={field.onChange}
//                       />
//                     </FormControl>
//                     <div className="space-y-1 leading-none">
//                       <FormLabel>Submit Anonymously</FormLabel>
//                       <p className="text-gray-500 text-sm">
//                         Your name will not be shown with this request
//                       </p>
//                     </div>
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="isPublic"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-row items-start space-x-3 space-y-0">
//                     <FormControl>
//                       <Checkbox
//                         checked={field.value}
//                         onCheckedChange={field.onChange}
//                       />
//                     </FormControl>
//                     <div className="space-y-1 leading-none">
//                       <FormLabel>Make Public</FormLabel>
//                       <p className="text-gray-500 text-sm">
//                         Allow all church members to see and pray for this
//                         request
//                       </p>
//                     </div>
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {!form.watch('isAnonymous') && (
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                 <FormField
//                   control={form.control}
//                   name="requesterName"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Your Name</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter your name" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="requesterEmail"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Your Email (Optional)</FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder="Enter your email"
//                           type="email"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             )}
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
//                 Submitting...
//               </>
//             ) : (
//               'Submit Prayer Request'
//             )}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }
