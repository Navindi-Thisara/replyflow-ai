import {
  Bot,
  MessageSquare,
  Users,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Messages",
    value: "1,284",
    change: "+12.5%",
    icon: MessageSquare,
  },
  {
    title: "Leads",
    value: "128",
    change: "+8.2%",
    icon: Users,
  },
  {
    title: "AI Replies",
    value: "842",
    change: "+24.8%",
    icon: Bot,
  },
  {
    title: "Conversion",
    value: "18.4%",
    change: "+3.2%",
    icon: TrendingUp,
  },
];

const conversations = [
  {
    name: "Sarah Wilson",
    message: "Do you have the blue sneaker in size 42?",
    status: "HOT",
  },
  {
    name: "James Carter",
    message: "How much is the Smart Watch Pro?",
    status: "WARM",
  },
  {
    name: "Emma Davis",
    message: "Can I order the wireless earbuds?",
    status: "NEW",
  },
  {
    name: "Michael Brown",
    message: "Is the black hoodie available?",
    status: "HOT",
  },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Good morning, Alex 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
      </header>

      <div className="space-y-8 p-8">
        {/* Statistics */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    {stat.title}
                  </p>

                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 flex items-end gap-3">
                  <p className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>

                  <span className="mb-1 text-sm font-medium text-emerald-600">
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Main content */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Activity */}
          <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Message Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Customer conversations over the last 7 days
                </p>
              </div>

              <select className="rounded-lg border px-3 py-2 text-sm">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>

            <div className="mt-8 flex h-64 items-end gap-4">
              {[45, 65, 52, 80, 68, 92, 74].map((height, index) => (
                <div
                  key={index}
                  className="flex flex-1 flex-col items-center gap-3"
                >
                  <div
                    className="w-full rounded-t-lg bg-indigo-500"
                    style={{ height: `${height}%` }}
                  />

                  <span className="text-xs text-slate-400">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI overview */}
          <div className="rounded-2xl border bg-slate-900 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-300">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold">AI Performance</h2>
                <p className="text-xs text-slate-400">
                  This month
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <Metric
                label="AI handled"
                value="842"
              />

              <Metric
                label="AI response rate"
                value="73%"
              />

              <Metric
                label="Average response"
                value="4 sec"
              />

              <Metric
                label="Leads identified"
                value="128"
              />
            </div>
          </div>
        </section>

        {/* Conversations */}
        <section className="rounded-2xl border bg-white">
          <div className="border-b p-6">
            <h2 className="font-semibold text-slate-900">
              Recent Conversations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest customer interactions
            </p>
          </div>

          <div className="divide-y">
            {conversations.map((conversation) => (
              <div
                key={conversation.name}
                className="flex items-center justify-between p-5"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {conversation.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {conversation.message}
                  </p>
                </div>

                <StatusBadge status={conversation.status} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    HOT: "bg-red-50 text-red-600",
    WARM: "bg-amber-50 text-amber-600",
    NEW: "bg-emerald-50 text-emerald-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status as keyof typeof styles]
      }`}
    >
      {status}
    </span>
  );
}