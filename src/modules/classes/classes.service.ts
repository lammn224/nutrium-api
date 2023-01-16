import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Classes, ClassesDocument } from '@/modules/classes/classes.schema';
import { Model } from 'mongoose';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Classes.name) private classesModel: Model<ClassesDocument>,
  ) {}
  async createNewClass(name: string, school: string): Promise<Classes> {
    const isExistedClass = await this.classesModel.findOne({ name, school });
    if (isExistedClass) return isExistedClass;
    return await this.classesModel.create({ name, school });
  }

  async addMember(name: string, school: string, members: any[]) {
    const isExistedClass = await this.classesModel.findOne({ name, school });
    if (isExistedClass) {
      isExistedClass.members = members;
      await isExistedClass.save();

      return isExistedClass;
    }
    return await this.classesModel.create({ name, school, members });
  }
}
