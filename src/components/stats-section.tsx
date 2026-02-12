import { Star } from "lucide-react";

export function StatsSection() {
  return (
    <section className="py-16 -mx-10 mb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">50K+</div>
            <div className="text-gray-600 dark:text-slate-300">Happy Patients</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">200+</div>
            <div className="text-gray-600 dark:text-slate-300">Healthcare Providers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">1M+</div>
            <div className="text-gray-600 dark:text-slate-300">Appointments Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">4.9</div>
            <div className="text-gray-600 dark:text-slate-300 flex items-center justify-center gap-1">
              <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
              User Rating
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
