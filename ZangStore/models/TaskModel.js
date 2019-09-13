const ns = '[TaskModel]'

import logger from 'applogger'
import DBWrapper from 'dbwrapper'

import TaskSchema from '../schemas/TaskSchema'


const TaskModel = {}

TaskModel.getTask = (req, query, cb) => {
  logger.info(req.requestId, ns, '[getTask]:query', JSON.stringify(query))
  DBWrapper.execute(
    TaskSchema,
    TaskSchema.findOne,
    req.requestId,
    query,
    (err, task) => {
      if(err){
        logger.error(req.requestId, ns, '[getTask]', err);
        cb(err)
      } else {
        cb(null, task)
      }
    }
  )
}

TaskModel.createTask = (req, taskData, cb) => {
  logger.info(req.requestId, ns, '[createTask]:taskData', JSON.stringify(taskData))
  let task = new TaskSchema(taskData)
  DBWrapper.execute( task, task.save,
    req.requestId,
    (err, newTask) => {
      if(err){
        logger.error(req.requestId, ns, '[createTask]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null, newTask)
      }
    }
  )
}

TaskModel.updateTask = (req, taskId, taskData, cb) => {
  logger.info(req.requestId, ns, '[updateTask]:taskId', JSON.stringify(taskId))
  logger.info(req.requestId, ns, '[updateTask]:taskData', JSON.stringify(taskData))
  DBWrapper.execute(
    TaskSchema,
    TaskSchema.findOneAndUpdate,
    req.requestId,
    { _id: taskId },
    taskData,
    (err, updatedTask) => {
      if(err){
        logger.error(req.requestId, ns, '[updateTask]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null, updatedTask)
      }
    }
  )
}

TaskModel.deleteTask = (req, query, cb) => {
  logger.info(req.requestId, ns, '[deleteTask]', JSON.stringify(query))
  DBWrapper.execute(
    TaskSchema,
    TaskSchema.remove,
    req.requestId,
    query,
    (err) => {
      if(err){
        logger.error(req.requestId, ns, '[deleteTask]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null)
      }
    }
  )
}

export default TaskModel
