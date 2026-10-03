"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Brain, GitBranch, Zap, Lock, MailOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Brain,
    title: "Current State",
    description: "See what your team believes right now. Every decision, requirement, and assumption backed by evidence.",
  },
  {
    icon: GitBranch,
    title: "How We Got Here",
    description: "A timeline from start to now. See which decisions changed, what triggered the change, and why.",
  },
  {
    icon: Zap,
    title: "What Changed",
    description: "In each meeting, ReMind flags what's different. Who might be working from old information.",
  },
  {
    icon: MailOpen,
    title: "External Context",
    description: "Connect Jira, GitHub, Slack. See the related conversations happening outside meetings.",
  },
  {
    icon: CheckCircle2,
    title: "Evidence-Backed",
    description: "Every claim has a direct quote from your transcript. No guessing, no unsourced claims.",
  },
  {
    icon: Lock,
    title: "Built for Privacy",
    description: "Transcripts aren't stored. Only structured output. GDPR-aligned, SOC 2 controls, full audit trail.",
  },
]

const integrations = [
  { name: "Google Meet", status: "Live", description: "Auto-join meetings and capture captions" },
  { name: "Jira", status: "Live", description: "Link issues to decisions" },
  { name: "GitHub", status: "Live", description: "Connect pull requests and issues" },
  { name: "Slack", status: "Coming soon", description: "Link conversations and threads" },
  { name: "Linear", status: "Coming soon", description: "Sync project updates" },
]

const captureOptions = [
  "Paste a transcript",
  "Use the Chrome extension for Google Meet",
  "Import Google Drive meeting notes",
  "Record in the browser",
  "Let the meeting bot join automatically",
]

export function HomePageClient() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* How to Capture Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4">
            How meetings get in
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-12 max-w-2xl">
            Choose how you capture. Everything flows through the same analysis engine.
          </motion.p>

          <motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {captureOptions.map((option, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-foreground">{option}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Core Value: The Three Questions */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto border-t border-border/50">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4">
            Three questions answered
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-12 max-w-2xl">
            The product answers these in order, backed by your meetings and the conversations around them.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                number: "1",
                question: "What do we believe right now?",
                description: "Current state: active decisions, requirements, constraints, assumptions. Each with evidence and confidence.",
              },
              {
                number: "2",
                question: "How did we get here?",
                description: "The path from start to now. Which decisions changed, what triggered it, and what's the evidence.",
              },
              {
                number: "3",
                question: "What else is being said?",
                description: "External context from Jira, GitHub, Slack. Related conversations outside of meetings.",
              },
            ].map((item, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="h-full border border-border/50 hover:border-border transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{item.question}</CardTitle>
                      </div>
                      <div className="text-3xl font-bold text-primary/30">{item.number}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto border-t border-border/50">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4">
            Built for trust and clarity
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-12 max-w-2xl">
            Every decision backed by evidence. No summaries, no guesses.
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="h-full border border-border/50 hover:border-border transition-colors">
                    <CardHeader>
                      <Icon className="w-6 h-6 text-primary mb-2" />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Integrations */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto border-t border-border/50">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4">
            Connect your workflow
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-12 max-w-2xl">
            Link your Jira, GitHub, and Slack. ReMind brings the context together.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map((integration, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="border border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          integration.status === "Live"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {integration.status}
                      </span>
                    </div>
                    <CardDescription className="text-sm">{integration.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto border-t border-border/50">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-6">
            Start with a transcript
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            No setup required. Paste a meeting transcript and see what ReMind extracts. Review before sending.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/app/dashboard">Start Now</Link>
            </Button>
            <Button size="lg" variant="outline">
              <a href="https://github.com/remind-project" target="_blank" rel="noreferrer">
                View on GitHub
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 md:py-24 px-4 md:px-8 border-t border-border/50 bg-accent/20">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">The memory of your project</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Built from your meetings and the conversations around them. See what you believe, how you got there, and what changed.
          </p>
          <Button size="lg" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
