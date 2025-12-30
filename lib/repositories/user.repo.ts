// User Repository
import { User, Prisma } from "@prisma/client";
import { BaseRepository, RepositoryOptions } from "./base.repo";

export class UserRepository extends BaseRepository {
  async findAll(options?: RepositoryOptions): Promise<User[]> {
    const client = this.getClient(options);
    return client.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(
    id: string,
    options?: RepositoryOptions
  ): Promise<User | null> {
    const client = this.getClient(options);
    return client.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(
    email: string,
    options?: RepositoryOptions
  ): Promise<User | null> {
    const client = this.getClient(options);
    return client.user.findUnique({
      where: { email },
    });
  }

  async findByStaffId(
    staffId: string,
    options?: RepositoryOptions
  ): Promise<User | null> {
    const client = this.getClient(options);
    return client.user.findUnique({
      where: { staffId },
    });
  }

  async findByRole(role: string, options?: RepositoryOptions): Promise<User[]> {
    const client = this.getClient(options);
    return client.user.findMany({
      where: { role: role as any },
      orderBy: { fullName: "asc" },
    });
  }

  async create(
    data: Prisma.UserCreateInput,
    options?: RepositoryOptions
  ): Promise<User> {
    const client = this.getClient(options);
    return client.user.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.UserUpdateInput,
    options?: RepositoryOptions
  ): Promise<User> {
    const client = this.getClient(options);
    return client.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, options?: RepositoryOptions): Promise<User> {
    const client = this.getClient(options);
    return client.user.delete({
      where: { id },
    });
  }

  async updateStatus(
    id: string,
    status: string,
    options?: RepositoryOptions
  ): Promise<User> {
    const client = this.getClient(options);
    return client.user.update({
      where: { id },
      data: { status },
    });
  }
}

export const userRepository = new UserRepository();
