package com.echomind.ai;

import java.util.List;

/** Provider abstraction so the LLM vendor can be swapped without touching controllers. */
public interface AiProvider {

    record ChatTurn(String role, String content) {}

    String name();

    boolean isDemo();

    String chat(List<ChatTurn> history, String prompt);

    default String summarize(String text) {
        return chat(List.of(), "Summarize the following conversation in 2-3 sentences:\n\n" + text);
    }

    default String answerFromContext(String question, List<String> passages) {
        String context = String.join("\n---\n", passages);
        return chat(List.of(new ChatTurn("system",
                "Answer only from the provided context. If the answer is not present, say you don't know.\n\nContext:\n" + context)),
                question);
    }
}
