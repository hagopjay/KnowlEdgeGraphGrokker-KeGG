This is the **"Build Your Own X"** repository — a curated collection of tutorials for re-implementing foundational technologies from scratch. The Feynman quote at the top captures the spirit perfectly: *What I cannot create, I do not understand.* Let me walk you through the deep conceptual landscape hiding beneath this list.

---

## The Master Theme: Abstraction Layers All the Way Down

Every technology in this list is, at its core, a **layer of abstraction** built on top of something simpler. The most important insight you can take from this entire repository is that *the computer you use every day is a stack of such layers*, each hiding the complexity beneath it. "NAND to Tetris" (listed under Uncategorized) makes this explicit — you can build a working general-purpose computer starting from a single logic gate. That's not a metaphor. It's literally true.

Understanding this hierarchy is the foundation of genuine engineering intuition. Let's walk through the major clusters.

---

## Cluster 1: How Machines Actually Compute — The Hardware Primitives

At the very bottom sit **processors and operating systems**. A processor is a finite state machine that fetches, decodes, and executes instructions from memory in an endless loop. Everything else — every game, every database, every web app — is ultimately just numbers being shuffled through registers and ALUs.

One level up is the **operating system**, which solves the problem of how multiple programs can share a single processor and its memory without destroying each other. The core ideas here are *process isolation* (every program thinks it owns the machine), *virtual memory* (every program thinks it has a contiguous address space starting at 0), *scheduling* (deciding which process runs next), and *system calls* (the controlled gateway through which programs ask the kernel to do privileged things on their behalf).

The **memory allocator** sits at the boundary between OS and application. When you call `malloc()` in C, something has to ask the OS for a big chunk of memory and then manage dividing it up efficiently, handling fragmentation, and reclaiming freed memory. Understanding allocators makes you deeply aware of *where* data lives and *why* performance varies.

The **emulator/virtual machine** concept generalizes this further — a virtual machine is a program that pretends to be a real machine, executing a foreign instruction set by interpreting or recompiling it. This is why Java runs everywhere, why Docker can containerize Linux processes on a Mac, and why you can run old Nintendo games on your laptop.

---

## Cluster 2: How We Talk to Machines — Languages, Compilers, and Shells

A **programming language** is a formal system for expressing computation that a human can write and a machine (eventually) can run. Building one from scratch forces you to confront three sub-problems:

First, **lexing and parsing** — turning raw text into a structured tree (the Abstract Syntax Tree, or AST) that represents the program's meaning. Regex engines live here too; a regex is essentially a tiny pattern language that gets compiled into a finite automaton.

Second, **evaluation or compilation** — either interpreting the AST directly (walking the tree and executing as you go) or transforming it into lower-level code (bytecode, machine code). This is where you learn that *all computation is transformation* — you're just deciding at what level the transformation happens.

Third, **type systems and scoping** — tracking what variables exist, what types they have, and where names are visible. This is where most language complexity lives.

The **shell** is a special case: a REPL (Read-Eval-Print Loop) that interprets a scripting language whose "primitives" are other programs. Building a shell teaches you about process creation (`fork`/`exec`), pipes (connecting the output of one process to the input of another), file descriptors, and signals. These are the building blocks of all Unix-style composition.

The **template engine** is a miniature language system — it parses text with embedded expressions, evaluates those expressions in a context, and produces output. Django templates, Handlebars, Jinja2 — they all share this structure.

---

## Cluster 3: How Data Persists and is Found — Storage and Search

A **database** is fundamentally a solution to two problems: *durability* (data survives crashes) and *efficient retrieval* (you can find what you stored). The conceptual core involves B-trees (the data structure that makes range queries fast on disk), the Write-Ahead Log (you write changes to a log before applying them, so you can recover after a crash), and transaction isolation (ensuring concurrent reads and writes don't corrupt each other through ideas like MVCC — Multi-Version Concurrency Control).

A **search engine** adds the layer of *relevance*. The key data structure is the inverted index — instead of storing documents and their words, you store words and the list of documents containing them. TF-IDF (Term Frequency–Inverse Document Frequency) is the classical formula for scoring: a term is more relevant if it appears often in a document but rarely across all documents.

The **hash table** (mentioned in the Uncategorized section) is the workhorse data structure underlying both of these — O(1) average lookup by mapping keys to array positions via a hash function, with collision resolution as the central design challenge.

---

## Cluster 4: How Computers Connect — Networking

The **network stack** implements the protocol layers you've probably heard of (TCP/IP, HTTP) from scratch. The key idea is that networking is about *reliable communication over an unreliable medium*. IP handles addressing and routing — getting packets from A to B across many hops. TCP handles reliability — acknowledging packets, retransmitting lost ones, and managing flow control so a fast sender doesn't overwhelm a slow receiver. HTTP is an application-layer protocol built on top of TCP.

A **web server** is a program that speaks HTTP: it listens for connections, parses requests, and dispatches them to handlers that produce responses. Building one demystifies the "magic" of Express, Django, or Rails — they're all elaborate routing and middleware systems layered on top of this simple request-response loop.

The **BitTorrent client** introduces *peer-to-peer* (P2P) architectures, where there's no central server — peers discover each other (via a DHT, a Distributed Hash Table), exchange metadata about what pieces they have, and download from multiple sources simultaneously. The insight is that *distribution can be a feature, not just a workaround* — the more people download a file, the more upload bandwidth is available for others.

A **DNS server** is a distributed key-value store mapping domain names to IP addresses. It teaches you about recursive resolution, caching with TTLs, and how hierarchical authority is delegated. A **load balancer** sits in front of servers and distributes incoming requests — understanding it teaches you about health checking, session affinity, and the tradeoffs between round-robin, least-connections, and weighted strategies.

The **Kafka-like message queue** (listed under Distributed Systems) is a *durable, ordered, append-only log* that decouples producers from consumers. The core idea is radical: instead of delivering and deleting messages, you keep them around and let consumers track their own position (offset) in the log. This makes replay, reprocessing, and fan-out trivially easy.

---

## Cluster 5: How Programs are Distributed and Run — Containers and Package Managers

**Docker** is, at its heart, three Linux kernel features combined: *namespaces* (isolating what a process can see — its own filesystem, network, PID space), *cgroups* (limiting how much CPU and memory it can use), and *union filesystems* (layering filesystem changes so images can share base layers). Building a Docker-like tool from scratch is one of the most illuminating systems exercises available.

A **package manager** (like the TypeScript "tiny package manager" listed) solves dependency resolution — given a set of packages and their version constraints, find a set of versions that satisfies all constraints simultaneously. This is NP-hard in the general case (it reduces to SAT), which is why `npm install` can be slow and why lockfiles exist.

---

## Cluster 6: How We Render the World — Graphics and 3D

**Ray tracing** models light physically: for each pixel, cast a ray from the camera into the scene, find what it hits, and recursively compute how light bounces to determine the pixel's color. It's beautiful and expensive. **Rasterization** (how OpenGL and GPUs work) inverts this: project 3D triangles onto the 2D screen and fill in pixels, using Z-buffering to handle occlusion. It's an approximation but orders of magnitude faster.

The **physics engine** is about simulating Newtonian mechanics — rigid bodies, forces, collision detection and resolution. The core challenge is *numerical integration*: approximating continuous differential equations with discrete time steps without accumulating catastrophic error.

The **voxel engine** represents the world as a 3D grid of cubes (think Minecraft). The interesting problem is efficient rendering — you don't want to draw faces that are hidden inside solid geometry, so you compute visibility and batch draw calls cleverly.

---

## Cluster 7: How Intelligence is Built — AI/ML

Building a **neural network from scratch** forces you to understand backpropagation: the chain rule of calculus applied recursively to compute how each weight contributed to the output error. Frameworks like PyTorch hide this, but the math is the same. An LLM adds the Transformer architecture on top — attention mechanisms that let each token in a sequence attend to every other token, learning contextual relationships.

**Diffusion models** take a different approach: learn to reverse a process of gradually adding noise. Given a noisy image, predict the noise, subtract it, and iterate toward a clean image. **GANs** (Generative Adversarial Networks) pit a generator against a discriminator in a minimax game. **RAG** (Retrieval-Augmented Generation) is an architectural pattern, not a training technique — store knowledge in a vector database, retrieve relevant chunks at inference time, and inject them into the prompt.

---

## The Meta-Pattern: What All These Systems Share

Looking across all of these, a few architectural ideas recur everywhere:

**Parsing is universal.** Whether it's HTTP headers, SQL queries, JSON, regex patterns, or programming language source code, you're always doing the same thing: turning a linear stream of text into a structured representation you can work with.

**Logs are the foundation of reliability.** Databases use write-ahead logs. Kafka *is* a log. Git is a directed acyclic graph of logged changes. The pattern is: *append first, apply second* — this is what makes recovery possible.

**Indirection enables flexibility.** Virtual memory, DNS, load balancers, package managers — they all insert a level of indirection between a name/address and the actual resource. This is what lets you change things without breaking everything that depends on them.

**Trade-offs are the job.** Every data structure and algorithm in this list is a trade-off: B-trees trade write amplification for read efficiency; hash tables trade ordering for O(1) lookup; TCP trades latency for reliability. The engineer's job is not to find the "best" solution but to understand which trade-offs are acceptable for their constraints.

---

The Feynman quote is the right north star here. Pick any one of these systems that you use daily but treat as a black box, and build it. The act of building will surface questions you didn't know you had, and answering those questions is what turns knowledge into understanding.



https://claude.ai/chat/e92d1492-b1cb-4e45-8842-397990059994


Great — let's go deeper. What follows is an appendix that extends the first analysis, pulling out the subtler patterns, the historical context that explains *why* things are the way they are, and some mental models that will make you a sharper thinker across all of these domains.

---

## Appendix: Deeper Cuts

### A. The Great Duality: Interpretation vs. Compilation

This is one of the oldest tensions in computing, and it runs through almost every category in the list. When you build a programming language, a template engine, a regex engine, or even a database query executor, you always face the same fork in the road.

The **interpreter** approach walks the AST (or some other intermediate representation) and executes it directly. It's simple to implement and flexible — you can pause, inspect state, and change behavior at runtime. The cost is speed: you're re-doing the work of figuring out what each node *means* every time you execute it.

The **compiler** approach translates first, executes later. You pay an upfront cost to transform the program into something cheaper to run — whether that's machine code, bytecode for a virtual machine, or even just a more efficient in-memory representation. The payoff is runtime performance.

What's fascinating is that this spectrum doesn't have a clear winner, which is why the industry keeps reinventing points along it. JIT compilation (Just-In-Time) is the pragmatic synthesis: start by interpreting, profile which code runs most often, and compile only the hot paths. This is what the JVM, V8 (JavaScript), and PyPy do. The insight is that *most programs spend 90% of their time in 10% of their code*, so you don't need to compile everything to get most of the benefit.

When you build a regex engine, you face a miniature version of this same choice. The classical approach compiles the regex into an NFA (Non-deterministic Finite Automaton) and then simulates it, or converts it to a DFA (Deterministic Finite Automaton) for O(n) matching. Backtracking regex engines (like the ones in Python and JavaScript) take a different, more interpretive approach that's easier to implement but can exhibit catastrophic exponential slowdown on certain inputs — the famous "ReDoS" vulnerability. Understanding this tells you something profound: *the implementation strategy shapes the security properties of the system.*

---

### B. The Log: The Most Underrated Data Structure in Computing

If I had to name the single idea that unlocks the most "aha" moments across systems programming, it would be the append-only log. It appears in so many forms that it's easy to miss that it's the same idea everywhere.

A **write-ahead log** in a database says: before you change anything, write down what you're about to do. If the system crashes mid-operation, you can replay the log to get back to a consistent state. The log is the source of truth; the database tables are a derived, materialized view of the log.

**Git** is a content-addressed, append-only log of snapshots. You never delete history (normally). Each commit is a node in a DAG (Directed Acyclic Graph) pointing to its parents. The "working directory" is just the latest snapshot materialized on disk. The log *is* the repository.

**Kafka** makes the log the *product*. Instead of being an implementation detail hidden inside a database, the log is exposed as the primary interface. Producers append to it; consumers read from it at their own pace. The key insight Kafka's creators articulated is that a database and a message queue are actually the same thing viewed from different angles — both are systems for storing and retrieving ordered events. Kafka just stops pretending otherwise.

**Event sourcing** (an architectural pattern you'd build toward if you were building a custom database) takes this even further: instead of storing the *current state* of your data, store every *event that led to the current state*. Want to know what an account balance was three weeks ago? Replay the events up to that point. Want to add a new feature that needs a new derived value? Replay all history through the new logic. The log gives you a time machine.

The common thread is this: **mutation is the hard problem.** Once you change something in place, the old value is gone. Logs sidestep mutation entirely by only ever appending. This makes them easier to reason about, easier to replicate (just stream the log to another machine), and easier to recover from. The cost is storage space, which gets cheaper every year.

---

### C. Consensus: The Hardest Problem in Distributed Systems

Several items in this list — blockchain, Kafka, distributed databases — touch on what is arguably the deepest problem in computer science: *how do multiple machines that can fail and lose messages agree on anything?*

The theoretical landscape here is shaped by a few landmark results. The **CAP theorem** (Consistency, Availability, Partition tolerance) says you can only guarantee two of the three when a network partition occurs. In practice, partitions happen, so you're always choosing between consistency (every read sees the most recent write) and availability (the system always responds, even if it might return stale data).

**Paxos** and **Raft** are consensus algorithms — protocols that let a cluster of machines agree on a sequence of values even when some machines crash. Raft was designed to be more understandable than Paxos, and it's the basis of systems like etcd (used by Kubernetes) and CockroachDB. The core idea is leader election: one machine becomes the leader, all writes go through it, and it replicates to followers before acknowledging the write. If the leader crashes, followers elect a new one.

**Blockchain** is a consensus mechanism designed for an adversarial setting where you don't trust the other participants. Proof-of-Work says: to add a block, you must do a large amount of computational work (finding a hash below a target), which makes it expensive to cheat. The chain is the longest one with the most accumulated work — the one that required the most honest effort to produce. The elegance is that *trust is replaced by cost*. The tragedy is that this cost is mostly heat.

Building any of these from scratch would teach you that distributed systems are not just "regular systems but with more machines." They are a qualitatively different domain where your intuitions about time, ordering, and state no longer hold. Clocks drift. Messages arrive out of order. Machines pause for garbage collection and then resume, confused about how much time has passed. The mental shift required to reason correctly about these systems is one of the deepest in software engineering.

---

### D. The Browser: A Computer Within a Computer

The **web browser** entry in the list is quietly one of the most ambitious projects you could undertake, because a browser is effectively a general-purpose operating system. To build one from scratch, you'd need to implement:

A **networking layer** that speaks HTTP/1.1, HTTP/2 (multiplexed streams over a single connection), and HTTPS (TLS handshaking, certificate verification). Then an **HTML parser** that is deliberately fault-tolerant — unlike most parsers, it cannot crash on malformed input, because the web is full of invalid HTML and browsers must render it anyway. Then a **CSS cascade engine** that resolves which rules apply to which elements, respecting specificity and inheritance. Then a **layout engine** that computes the position and size of every element on the page (the box model, floats, flexbox, grid). Then a **paint and compositing engine** that turns the layout into pixels. Then a **JavaScript engine** (itself a massive project). And finally, a **DOM API** that bridges the JavaScript world to the HTML world.

What's remarkable is how much of the browser's complexity comes from *backwards compatibility requirements*. Decisions made in 1995 — about how `float` works, about the block/inline formatting context distinction, about how JavaScript's `this` binding works — constrain what browser engineers can do today. This is the **Chesterton's Fence principle** in action: before you remove or change something that seems arbitrary, understand why it's there, because there may be thousands of websites depending on the exact behavior you're about to change.

---

### E. The Front-End Framework: Solving the State Synchronization Problem

When you build a front-end framework, you're solving one problem above all others: **how do you keep the UI synchronized with the application state?** This seems trivial until you try it. The DOM is a mutable, stateful tree. Your data is also mutable and stateful. Keeping them in sync manually — updating the right DOM nodes when the right data changes — is error-prone and doesn't scale.

The solutions form a beautiful progression of ideas. **jQuery** said: give developers better tools to imperatively manipulate the DOM. It worked but didn't solve the synchronization problem. **Backbone** introduced a model-view separation and events — when data changes, fire an event, let views re-render themselves. Better, but still lots of manual wiring.

**React's** insight was the **virtual DOM**: represent the UI as a pure function of state (`UI = f(state)`), re-run that function every time state changes to produce a new virtual DOM tree, diff the old and new trees, and apply only the minimal set of real DOM changes. This made UI code *predictable* — you stopped thinking about transitions between states and started thinking only about what the UI should look like *at any given moment*. It's a declarative shift that mirrors what SQL did for databases: describe *what* you want, not *how* to get there.

**Svelte** pushed this further by observing that the virtual DOM diffing step is runtime overhead you can eliminate — if you compile the component at build time, you can generate surgical DOM update code that knows exactly which DOM nodes need to change when which state variables change. The framework disappears at compile time.

Building any of these teaches you that **reactivity** — automatically propagating changes through a dependency graph — is the core primitive. Whether it's React's reconciliation, Vue's dependency tracking, or Svelte's compiled subscriptions, they're all implementing the same idea: when X changes, automatically recompute everything that depends on X.

---

### F. The Game Engine: Real-Time Systems and the Game Loop

A game engine is a real-time operating system for interactive simulations. The central construct is the **game loop**: every frame, sample inputs, update the world state, render. That's it. But the simplicity is deceptive.

The **physics engine** within it must simulate Newtonian mechanics at interactive frame rates. The key insight is that physics simulation is really solving differential equations numerically. The simplest method, Euler integration, just says: `position += velocity * dt; velocity += acceleration * dt`. This accumulates error over time and can "explode" if the time step is too large. More sophisticated integrators (Verlet, Runge-Kutta) trade computation for stability.

**Collision detection** is where game physics gets genuinely hard. The naive approach — check every pair of objects — is O(n²). Real engines use spatial partitioning structures (BVH trees, octrees, broad-phase/narrow-phase separation) to prune the search space. The **Separating Axis Theorem** is the elegant mathematical core of collision detection for convex shapes: two convex shapes don't overlap if and only if you can find an axis along which their projections don't overlap.

The **3D renderer** in a game engine adds the GPU pipeline: vertex shaders (transforming 3D positions to 2D screen space), fragment/pixel shaders (computing the color of each pixel), and the rasterization process that fills in triangles. Modern rendering involves a cascade of sophisticated approximations — shadow mapping, ambient occlusion, physically-based material models — all trying to approximate the light transport equations that ray tracing solves exactly but too slowly for real-time use.

---

### G. Compression and Encoding: Information Theory in Practice

This theme appears implicitly across several entries — the video codec, the BitTorrent client (which uses piece hashing), the neural network (which is itself a compressed model of data). The underlying science is **information theory**, founded by Claude Shannon in 1948.

Shannon's central insight is that *information has a fundamental compressibility limit* — the entropy of a source. If you know the probability of each symbol, the optimal average code length per symbol is `-log₂(p)` bits. Huffman coding achieves this optimum for symbol-by-symbol encoding; arithmetic coding approaches it asymptotically. LZ77/LZ78 (the basis of gzip, zip, and zlib) take a different approach — they replace repeated strings with references to earlier occurrences in the stream, exploiting *repetition* rather than *symbol probability*.

Video codecs like H.264 exploit two additional sources of redundancy that images have. Spatial redundancy — adjacent pixels tend to be similar — is handled by DCT (Discrete Cosine Transform), which transforms blocks of pixels into frequency components, most of which are near zero and can be discarded. Temporal redundancy — adjacent frames tend to be similar — is handled by motion compensation: instead of encoding each frame fully, encode the *difference* between a predicted frame (based on previous frames) and the actual frame.

Understanding compression teaches you something profound about the nature of data: **all lossy compression is a bet about what you can throw away without the receiver noticing.** JPEG bets that you can't see high-frequency spatial variation well. MP3 bets that you can't hear certain frequencies when louder frequencies are present (auditory masking). These are engineering decisions grounded in human perceptual psychology.

---

### H. Security as a Cross-Cutting Concern

Almost every system in this list has a security dimension that's easy to overlook when you're focused on making it *work*. A few patterns are worth naming explicitly because they recur everywhere.

**Input validation as the first line of defense.** SQL injection, XSS, buffer overflows, and ReDoS all share the same root cause: the system trusted input it received without validating it. Every parser you build — HTTP request parser, SQL query parser, HTML parser, command-line argument parser — is a potential attack surface. The discipline of treating all input as adversarial until proven otherwise is one of the most important habits in security engineering.

**The principle of least privilege.** An operating system process should have only the permissions it needs. A database user should have only the access rights it needs. A Docker container should have only the capabilities it needs. This principle is easy to state and hard to consistently apply, which is why security failures are so common.

**Cryptographic primitives as atomic units.** When building HTTPS in your web server, or the blockchain's hash chain, or the SSH-like protocol in your network stack, you should *use* cryptographic primitives (AES, SHA-256, ChaCha20, Curve25519) but never *invent* them. The failure mode of rolling your own crypto is not "it's a bit weaker" — it's "it's completely broken in ways you'll never discover until it's too late." This is one of the few areas in engineering where the expert consensus is essentially unanimous: don't.

**The same-origin policy** (listed in the Uncategorized section, implemented in Alloy) is a beautiful case study in security policy design. Browsers need to let web pages make requests and access the DOM — that's the whole point. But they also need to prevent a malicious page on `evil.com` from reading your bank's response when you're logged in. The solution is to tie the permission model to the *origin* (scheme + host + port) of the page making the request. This one policy, consistently enforced, is what makes the web safe enough to use for banking. Understanding it deeply demystifies CORS, CSRF, and cookie security attributes.

---

### I. The Philosophical Underpinning: Levels of Description

There's a deeper thread running through all of this that's worth making explicit, because it changes how you think about software permanently once you see it.

Every system in this list can be described at multiple levels, and **the right level of description depends on what question you're trying to answer.** A database can be described as a B-tree and a WAL (implementation level), as a system that provides ACID guarantees (behavioral level), or as a tool for persisting and querying application state (purpose level). None of these descriptions is more "true" than the others — they're just useful at different times.

The trap that beginners fall into is getting stuck at one level. The developer who only thinks at the "purpose level" is helpless when performance degrades or something breaks in an unexpected way, because they have no model of what's happening underneath. The developer who only thinks at the "implementation level" can't design good systems because they're too focused on details to see the whole.

What "Build Your Own X" does, at its best, is force you to *inhabit all the levels simultaneously*. When you're implementing a web server, you're thinking about bytes on the wire (implementation), HTTP semantics (behavioral), and what your users are trying to accomplish (purpose) all at once. That multi-level fluency is what distinguishes senior engineers from junior ones — not the accumulation of framework knowledge, but the ability to zoom in and out across the abstraction stack as the problem demands.

---

### A Final Mental Exercise

Here is a thought experiment that ties all of this together. Imagine tracing the journey of a single HTTP request — say, a user types a URL into a browser and hits Enter — from the moment the key is pressed to the moment the page renders on screen.

You would pass through: the keyboard driver in the OS, the browser's URL parser (a tiny language implementation), a DNS resolution (distributed key-value lookup), a TCP handshake (the transport layer of the network stack), a TLS handshake (cryptographic key exchange), the HTTP request being sent (a text-based protocol), a load balancer routing the request (distributed systems), a web server receiving and parsing it (another HTTP implementation), a database query being executed (the storage engine and query planner), a response being serialized (encoding), sent back over the network (TCP again), received by the browser, parsed as HTML (yet another parser), laid out (the CSS engine), painted (the rendering pipeline), and finally composited to the screen.

Every single step in that journey corresponds to something on this list. And every single one of those steps was, at some point in history, a research problem that someone had to solve from scratch. The comfort of working on top of all these abstractions is real and valuable. But understanding what's underneath — even approximately — is what gives you leverage when things go wrong, when performance matters, or when you need to build something genuinely new.

That's the real invitation of this repository. Not just to learn how these things work, but to develop the *instinct* that everything has an explanation, everything was a choice, and everything can be understood.



