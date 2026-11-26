package com.echomind.ai;

import java.util.List;
import java.util.Locale;

/** Deterministic, offline responses for Demo Mode. Never presented as real model output. */
public class DemoAiProvider implements AiProvider {

    @Override public String name() { return "DEMO"; }

    @Override public boolean isDemo() { return true; }

    @Override
    public String chat(List<ChatTurn> history, String prompt) {
        String p = prompt.toLowerCase(Locale.ROOT);
        if (p.startsWith("summarize")) {
            return "[Demo] This conversation covered the user's goal, key constraints and agreed next steps.";
        }
        if (p.contains("plan") || p.contains("roadmap")) {
            return "[Demo] 1) Define the outcome. 2) Split into weekly milestones. 3) Assign owners and risks. 4) Review every Friday.";
        }
        if (p.contains("spring") || p.contains("java")) {
            return "[Demo] Keep controllers thin, put logic in @Service classes, and use Spring Data JPA repositories.";
        }
        boolean hasContext = history.stream().anyMatch(t -> t.role().equals("system") && t.content().contains("Context:"));
        if (hasContext) {
            String ctx = history.get(0).content();
            String first = ctx.substring(ctx.indexOf("Context:") + 8).trim().split("\n---\n")[0];
            return "[Demo] Based on the document: " + first;
        }
        return "[Demo] Received: \"" + prompt.substring(0, Math.min(prompt.length(), 120))
                + "\". Configure AI_PROVIDER=OPENAI to get real model responses.";
    }
}
