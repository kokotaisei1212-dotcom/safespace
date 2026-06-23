import { kv } from "@vercel/kv";

export const db = {
  users: {
    create: async (data: { username: string; email: string; password: string; verified: boolean }) => {
      const user = {
        ...data,
        id: Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
      };
      await kv.hset(`user:${user.id}`, user);
      await kv.set(`email:${user.email}`, user.id);
      return user;
    },
    findByEmail: async (email: string) => {
      const id = await kv.get<string>(`email:${email}`);
      if (!id) return null;
      return kv.hgetall(`user:${id}`);
    },
    verify: async (email: string) => {
      const id = await kv.get<string>(`email:${email}`);
      if (id) await kv.hset(`user:${id}`, { verified: true });
    },
  },
  posts: {
    create: async (data: { userId: string; username: string; content: string }) => {
      const post = {
        ...data,
        id: Math.random().toString(36).slice(2),
        likes: 0,
        createdAt: new Date().toISOString(),
      };
      await kv.hset(`post:${post.id}`, post);
      await kv.lpush("posts", post.id);
      return post;
    },
    all: async () => {
      const ids = await kv.lrange("posts", 0, 50);
      if (!ids.length) return [];
      const posts = await Promise.all(ids.map((id) => kv.hgetall(`post:${id}`)));
      return posts.filter(Boolean);
    },
    like: async (id: string) => {
      await kv.hincrby(`post:${id}`, "likes", 1);
    },
  },
};
