import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Award, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentResults() {
  const { data: dashboardData, isLoading: isDashboardLoading } = trpc.student.dashboard.useQuery();
  const { data: academicData, isLoading: isAcademicLoading } = trpc.student.academicResults.useQuery();

  const isLoading = isDashboardLoading || isAcademicLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        <Skeleton className="h-8 w-64" />
        <Card className="border-slate-200">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  const { student } = dashboardData || {};
  const transcript = academicData?.transcript || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 print:p-0 print:space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Academic Results</h2>
          <p className="text-slate-500 mt-1 print:hidden">View your project allocation and complete academic transcript.</p>
        </div>
        <Button variant="outline" className="print:hidden" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Print Transcript
        </Button>
      </div>
      
      {/* Allocation Status Section */}
      <section className="space-y-4 print:hidden">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
          <Award className="w-5 h-5 text-indigo-500" />
          Project Allocation
        </h3>
        {!student ? (
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="py-8 text-center text-slate-500">
              Please complete your profile to view your allocation status.
            </CardContent>
          </Card>
        ) : student.allocationStatus === "allocated" ? (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-emerald-900 font-semibold text-lg">Allocation Successful</h4>
                <p className="text-emerald-700">Congratulations! You have been allocated a supervisor. Please check your dashboard for full details.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="py-8 text-center text-slate-500 flex flex-col items-center">
              <BookOpen className="w-8 h-8 text-slate-300 mb-3" />
              <p>Allocation results will appear here once finalized by the administration.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Transcript Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          Academic Transcript
        </h3>

        {!student ? (
           <Card className="border-slate-200 bg-slate-50">
             <CardContent className="py-8 text-center text-slate-500">
               Please complete your profile to view your transcript.
             </CardContent>
           </Card>
        ) : transcript.length === 0 ? (
          <Card className="border-slate-200 bg-slate-50">
             <CardContent className="py-8 text-center text-slate-500">
               No academic records found.
             </CardContent>
           </Card>
        ) : (
          <Tabs defaultValue={transcript[transcript.length - 1]?.level} className="w-full">
            <TabsList className="w-full justify-start border-b border-slate-200 rounded-none bg-transparent h-auto p-0 mb-6">
              {transcript.map((term) => (
                <TabsTrigger 
                  key={term.level} 
                  value={term.level}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-medium transition-all"
                >
                  {term.level}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {transcript.map((term) => {
              const totalUnits = term.courses.reduce((acc, curr) => acc + curr.units, 0);
              const totalPoints = term.courses.reduce((acc, curr) => {
                let points = 0;
                if (curr.grade === 'A') points = 5;
                if (curr.grade === 'B') points = 4;
                if (curr.grade === 'C') points = 3;
                if (curr.grade === 'D') points = 2;
                if (curr.grade === 'E') points = 1;
                return acc + (points * curr.units);
              }, 0);
              const gpa = (totalPoints / totalUnits).toFixed(2);

              return (
                <TabsContent key={term.level} value={term.level} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card className="border-slate-200 overflow-hidden shadow-sm">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">Course Results</CardTitle>
                          <CardDescription>Performance for {term.level} Session</CardDescription>
                        </div>
                        <div className="flex gap-4">
                          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Total Units</p>
                            <p className="text-lg font-bold text-slate-900">{totalUnits}</p>
                          </div>
                          <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 shadow-sm">
                            <p className="text-xs text-indigo-500 uppercase font-semibold">Session GPA</p>
                            <p className="text-lg font-bold text-indigo-700">{gpa}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4">Course Code</th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4 text-center">Units</th>
                            <th className="px-6 py-4 text-center">Score</th>
                            <th className="px-6 py-4 text-center">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {term.courses.map((course) => (
                            <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-900">{course.code}</td>
                              <td className="px-6 py-4 text-slate-600">{course.title}</td>
                              <td className="px-6 py-4 text-center text-slate-600">{course.units}</td>
                              <td className="px-6 py-4 text-center font-medium text-slate-900">{course.score}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                  ${course.grade === 'A' ? 'bg-emerald-100 text-emerald-700' : ''}
                                  ${course.grade === 'B' ? 'bg-blue-100 text-blue-700' : ''}
                                  ${course.grade === 'C' ? 'bg-amber-100 text-amber-700' : ''}
                                  ${course.grade === 'D' || course.grade === 'E' ? 'bg-orange-100 text-orange-700' : ''}
                                  ${course.grade === 'F' ? 'bg-red-100 text-red-700' : ''}
                                `}>
                                  {course.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </section>
    </div>
  );
}
